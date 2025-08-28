// RoutineModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,

  SafeAreaView,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

// Updated color theme with your colors
const colors = {
  // Your color theme
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
};

// Sample routine steps - you can move this to a separate data file
const ROUTINE_STEPS = [
  {
    icon: "🧼",
    title: "Gentle Cleanse",
    description: "Start with our gentle foam cleanser to remove dirt and impurities from your day",
    tips: "Use lukewarm water and massage in circular motions for 30 seconds",
    duration: "2 min",
    image: "https://i.ibb.co/C5VQ1KF6/Untitled-design.png"
  },
  {
    icon: "💧",
    title: "Hydrating Toner",
    description: "Apply our rose-infused toner to balance and prep your skin for the next steps",
    tips: "Pat gently with cotton pad or use your hands for better absorption",
    duration: "1 min",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop&crop=center"
  },
  {
    icon: "✨",
    title: "Nourishing Serum",
    description: "Our vitamin C serum will brighten and protect your skin overnight",
    tips: "Apply 2-3 drops and press gently into skin, avoiding the eye area",
    duration: "1 min",
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=300&fit=crop&crop=center"
  },
  {
    icon: "🌙",
    title: "Night Moisturizer",
    description: "Finish with our rich night cream to lock in moisture while you sleep",
    tips: "Use upward strokes and don't forget your neck and décolletage",
    duration: "2 min",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop&crop=center"
  },
];

const RoutineModal = ({
  visible,
  onClose,
  currentStep,
  onNextStep,
  onComplete,
  routineSteps = ROUTINE_STEPS, // Allow custom steps to be passed
}) => {
  const step = routineSteps[currentStep];
  const isLastStep = currentStep === routineSteps.length - 1;
  const progress = ((currentStep + 1) / routineSteps.length) * 100;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
       colors={[colors.mediumPink, colors.deepBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modalContainer}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          {/* Subtle decorative elements */}
          <View style={styles.decorativeElement1} />
          <View style={styles.decorativeElement2} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.stepCounter}>
              <Text style={styles.stepCounterText}>
                {currentStep + 1}/{routineSteps.length}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          {/* Step Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepContainer}>
              {/* Step Image */}
              <View style={styles.stepImageContainer}>
                <Image
                  source={{ uri: step.image }}
                  style={styles.stepImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
                
                {/* Step Icon */}
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>

                {/* Duration Badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>⏱️ {step.duration}</Text>
                </View>
              </View>

              {/* Content Card */}
              <View style={styles.contentCard}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>

                <View style={styles.tipContainer}>
                  <Text style={styles.tipLabel}>💡 Pro Tip</Text>
                  <Text style={styles.tipText}>{step.tips}</Text>
                </View>

                {/* Step Indicators */}
                <View style={styles.stepIndicators}>
                  {routineSteps.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        index <= currentStep
                          ? styles.indicatorActive
                          : styles.indicatorInactive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={isLastStep ? onComplete : onNextStep}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.darkBlue, colors.deepBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? "✨ Complete Routine" : "Next Step →"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
    position: 'relative',
  },
  // Subtle decorative elements with updated colors
  decorativeElement1: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    opacity: 0.3,
  },
  decorativeElement2: {
    position: 'absolute',
    bottom: 150,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    opacity: 0.4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.almostBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.almostBlack,
  },
  stepCounter: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: colors.almostBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.almostBlack,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.white,
    borderRadius: 2,
    overflow: 'hidden',
    opacity: 0.6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.deepBlue,
    borderRadius: 2,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepImageContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: colors.almostBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.white,
  },
  stepImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.almostBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepIcon: {
    fontSize: 24,
  },
  durationBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: colors.almostBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mediumGray,
  },
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.almostBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.almostBlack,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: colors.mediumGray,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  tipContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: colors.mediumPink,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.almostBlack,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.mediumGray,
    lineHeight: 20,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorActive: {
    backgroundColor: colors.deepBlue,
  },
  indicatorInactive: {
    backgroundColor: colors.border,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.almostBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default RoutineModal;