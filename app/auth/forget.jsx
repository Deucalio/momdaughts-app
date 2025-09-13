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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "../../components/Text";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSendCode = () => {
    console.log("Email:", email);
    // Add email validation logic here
    if (email) {
      // router.push("/auth/otp");

      router.replace({
        pathname: "/auth/otp",
        params: { email: email },
      });
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
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Don't worry! Enter your email address and we'll send you a
              verification code.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
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
            </View>

            <TouchableOpacity
              style={styles.sendCodeButton}
              onPress={handleSendCode}
            >
              <Text style={styles.sendCodeButtonText}>Send Code</Text>
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
    fontFamily: "Outfit-Bold",
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
    transform: "translateY(2px)",
  },
});
