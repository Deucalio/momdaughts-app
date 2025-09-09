"use client";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

const handleResetPassword = async () => {
  const passwordErrors = validatePassword(password);
  const newErrors = { ...passwordErrors };
  
  if (!confirmPassword) {
    newErrors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }
  // Clear confirmPassword error if passwords match
  else if (password === confirmPassword && errors.confirmPassword) {
    delete newErrors.confirmPassword;
  }
  
  setErrors(newErrors);
  
  if (Object.keys(newErrors).length > 0) {
    return;
  }
  
  setIsLoading(true);
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push("/auth/login");
  } catch (err) {
    setErrors({ general: "Password reset failed. Please try again." });
  } finally {
    setIsLoading(false);
  }
};

  const validatePassword = (pwd) => {
    const errors = {};
    if (!pwd) {
      errors.password = "Password is required";
    } else if (pwd.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }
    return errors;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#4a5568" />
            </TouchableOpacity>
          </View>

          {/* Logo and Brand Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.svg")}
                style={{
                  marginTop: 20,
                  width: 200,
                  height: 200,
                }}
                contentFit="contain"
                placeholder="Brand Logo"
              />
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password for your account. Make sure it's at least
              8 characters long.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  errors.password && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: null }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                />

                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {/* ADD ERROR MESSAGE RIGHT HERE */}
              {errors.password ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  value={confirmPassword}
               onChangeText={(text) => {
  setConfirmPassword(text);
  // Clear error when passwords match or when user is typing
  if (errors.confirmPassword && (text === password || !text)) {
    setErrors(prev => ({ ...prev, confirmPassword: null }));
  }
}}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {/* ADD ERROR MESSAGE RIGHT HERE */}
              {errors.confirmPassword ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
              ) : null}
            </View>

            {/* General error before the button */}
            {errors.general ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Text>
            </TouchableOpacity>

            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>
                Remember your password?{" "}
                <TouchableOpacity onPress={() => router.push("/auth/login")}>
                  <Text style={styles.signInLink}>Sign In here</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 10,
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    gap: 16,
    paddingBottom: 30,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 4,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#2d3748",
    marginLeft: 10,
  },
  inputIcon: {
    marginRight: 0,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: "#2d3748",
    marginLeft: 10,
  },
  passwordToggle: {
    padding: 2,
  },
  sendCodeButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2c2a6b",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  sendCodeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  verifyButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2c2a6b",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2c2a6b",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  signInPrompt: {
    alignItems: "center",
    marginTop: 20,
  },
  signInText: {
    fontSize: 13,
    color: "#718096",
  },
  signInLink: {
    color: "#df367c",
    fontWeight: "600",
    fontSize: 12,
  },
  // OTP specific styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    borderWidth: 1,
    borderColor: "#2c2a6b",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: "#718096",
  },
  resendText: {
    fontSize: 14,
    color: "#df367c",
    fontWeight: "600",
  },
  inputError: {
    // borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginLeft: 4,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
