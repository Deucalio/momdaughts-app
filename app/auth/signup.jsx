"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
// import { useAuthStore } from "../utils/authStore";
import { signUpWithCustom } from "../utils/auth";

export default function SignUpPage() {
  // const { signUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  });

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ];

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateAccount = async () => {
    const newFormData = { ...formData };
    console.log("Form data:", newFormData);
    const { email, password, firstName, lastName } = newFormData;
    try {
      await signUpWithCustom(email, password, firstName, lastName);
    } catch (e) {
      console.log("Error: ", e);
    }
    // Push him to the front page
    // router.push("/");
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
              <Ionicons name="arrow-back" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Join MomDaughts</Text>
          </View>

          {/* Sign Up Form */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>
                Start your wellness journey with us
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData("firstName", value)}
                  />
                </View>
                <View style={styles.nameInput}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData("lastName", value)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData("password", value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Requirements */}
                {formData.password && (
                  <View style={styles.passwordRequirements}>
                    {passwordRequirements.map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color={req.met ? "#10b981" : "#d1d5db"}
                        />
                        <Text
                          style={[
                            styles.requirementText,
                            { color: req.met ? "#10b981" : "#6b7280" },
                          ]}
                        >
                          {req.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      updateFormData("confirmPassword", value)
                    }
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                  )}
              </View>

              <View style={styles.checkboxGroup}>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() =>
                    updateFormData("agreeToTerms", !formData.agreeToTerms)
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.agreeToTerms && styles.checkboxChecked,
                    ]}
                  >
                    {formData.agreeToTerms && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    I agree to the{" "}
                    <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() =>
                    updateFormData(
                      "subscribeNewsletter",
                      !formData.subscribeNewsletter
                    )
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.subscribeNewsletter && styles.checkboxChecked,
                    ]}
                  >
                    {formData.subscribeNewsletter && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    Subscribe to wellness tips and product updates
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.createAccountButton,
                  (!formData.agreeToTerms ||
                    formData.password !== formData.confirmPassword) &&
                    styles.createAccountButtonDisabled,
                ]}
                disabled={
                  !formData.agreeToTerms ||
                  formData.password !== formData.confirmPassword
                }
              >
                <LinearGradient
                  colors={["#ec4899", "#8b5cf6"]}
                  style={styles.createAccountGradient}
                >
                  <Text
                    onPress={() => handleCreateAccount()}
                    style={styles.createAccountText}
                  >
                    Create Account
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.signInPrompt}>
                <Text style={styles.signInText}>
                  Already have an account?{" "}
                  <TouchableOpacity onPress={() => router.push("/auth/login")}>
                    <Text style={styles.signInLink}>Sign in</Text>
                  </TouchableOpacity>
                </Text>
              </View>
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
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ec4899",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 32,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ec4899",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#fce7f3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fce7f3",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passwordRequirements: {
    gap: 4,
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  checkboxGroup: {
    gap: 16,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#ec4899",
    borderColor: "#ec4899",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  linkText: {
    color: "#ec4899",
    fontWeight: "600",
  },
  createAccountButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  createAccountButtonDisabled: {
    opacity: 0.5,
  },
  createAccountGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  createAccountText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signInPrompt: {
    alignItems: "center",
    marginTop: 16,
  },
  signInText: {
    fontSize: 14,
    color: "#6b7280",
  },
  signInLink: {
    color: "#ec4899",
    fontWeight: "600",
  },
});
