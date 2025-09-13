// SignUpPage.js
"use client";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "../../components/Text";
import { signUpWithCustom } from "../utils/auth";
import { useAuthStore } from "../utils/authStore";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const {user} = useAuthStore();

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signUpWithCustom(
        email,
        password,
        firstName,
        lastName,
        phone
      );

      console.log("Sign up result:", result);
      if (result.success) {
        // Alert.alert(
        //   "Success",
        //   "Account created successfully! Please check your email for verification.",
        //   [{ text: "OK", onPress: () => router.push("/auth/login") }]
        // );
        router.replace("/auth/otp");
      } else {
        // Handle specific error cases
        if (result.error?.includes("email")) {
          setErrors({ email: "An account with this email already exists" });
        } else if (result.error?.includes("phone")) {
          setErrors({ phone: "This phone number is already registered" });
        } else {
          // Alert.alert("Error", result.error || "Failed to create account");
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      // Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
                source={require("../../assets/images/logo-belowtext.png")}
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

          {/* Sign Up Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>Sign up to get started</Text>

            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.firstName && styles.inputError,
                ]}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your first name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.lastName && styles.inputError,
                ]}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email && styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail"
                  size={16}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.phone && styles.inputError,
                ]}
              >
                <Ionicons
                  name="call"
                  size={16}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
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
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#9ca3af"
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  errors.confirmPassword && styles.inputError,
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
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#9ca3af"
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
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Sign In Prompt */}
            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>
                Already have an account?{" "}
                <TouchableOpacity onPress={() => router.replace("/auth/login")}>
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
  formContainer: {
    flex: 1,
    gap: 16,
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: "Outfit-Bold",
    color: "#2d3748",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 4,
    fontFamily: "Outfit-Medium",
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
    borderWidth: 0.1,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ef4444",
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
    // elevation: 2,
    borderWidth: 0.1,
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
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  signUpButton: {
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
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
    fontSize: 12,
  },
});
