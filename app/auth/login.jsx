"use client";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleAuthComponent from "../../components/GoogleAuthComponent";
import Text from "../../components/Text";
import { signInWithCustom } from "../utils/auth";
import { useAuthStore } from "../utils/authStore";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const {user} = useAuthStore();

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    const { success, error } = await signInWithCustom(phoneNumber, password);
    if (success) {
      router.replace("/(tabs)");
    }

    setIsLoading(false);

    if (!success) {
      setError(error);
    }
  };
  if (user&& user.metaData.authMethod==="google") {
    router.replace("/(tabs)");
    return;
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo and Brand Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                // source={{ uri: "https://i.ibb.co/391FfHYS/Layer-1.png" }}
                // style={styles.logo}
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
            {/* <Text style={styles.brandName}>MomDaughts</Text> */}

            {/* <Text style={styles.brandName}>
                          <Text
                            style={{
                              color: "#2c2a6b",
                            }}
                          >
                            Mom
                          </Text>
                          Daughts
                        </Text> */}
          </View>

          {/* Login Form */}
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
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="• • • • • • • • • • • •"
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
            </View>

            <TouchableOpacity
              onPress={() => router.push("/auth/forget")}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <View style={styles.signUpPrompt}>
              <Text style={styles.signUpText}>
                Don't have an account?{" "}
                <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                  <Text style={styles.signUpLink}>Sign Up here</Text>
                </TouchableOpacity>
              </Text>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <GoogleAuthComponent />
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
    // backgroundColor: "#f8f9fa",

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
  logo: {
    width: 70,
    height: 70,
  },
  brandName: {
    fontSize: 32,
    letterSpacing: 0.5,
    color: "#f596bb",
    fontFamily: "BadlocICG-Regular",
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
  phoneContainer: {
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
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  flagIcon: {
    width: 20,
    height: 14,
    marginRight: 6,
    borderRadius: 2,
  },
  countryCode: {
    fontSize: 14,
    color: "#2d3748",
    fontFamily: "Outfit-Medium",
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: "#2d3748",
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -6,
  },
  forgotPassword: {
    fontSize: 13,
    color: "#718096",
  },
  loginButton: {
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
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
  },
  orText: {
    textAlign: "center",
    fontSize: 13,
    color: "#718096",
    marginVertical: 16,
  },
  socialContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  signUpPrompt: {
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  signUpText: {
    fontSize: 13,
    color: "#718096",
  },
  signUpLink: {
    color: "#df367c",
    fontFamily: "Outfit-SemiBold",
    fontSize: 12,
    transform: "translateY(2px)",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: 13,
    color: "#718096",
    paddingHorizontal: 16,
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
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
  },
});
