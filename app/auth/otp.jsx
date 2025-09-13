"use client";

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { sendOTP, verifyOTP } from "../utils/actions";
import { useAuthStore } from "../utils/authStore";

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  console.log("email----:", email);

  const { user, syncUserMetaData } = useAuthStore();

  const sendOTP_ = async () => {
    setError("");
    try {
      const res = await sendOTP({
        email: user?.email ? user.email : email,
        is_password_reset: !user ? true : false,
      });
      console.log("res:", res);
      if (!res.success) {
        setError(res.error);
        return;
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    sendOTP_();
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    // Clear error when user starts typing
    if (error) setError("");

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call - replace with actual verification logic
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await verifyOTP(user?.email ? user.email : email, otpCode);
      console.log("verify:", res);

      // For demo: reject if OTP is not "123456"
      if (!res.success) {
        // setError("Invalid verification code. Please try again.");
        setError(res.error);
        //   setOtp(["", "", "", "", "", ""]);
        //   inputRefs.current[0]?.focus();
      } else {
        if (!user) {
          // that means he must be using forget password
          router.replace({
            pathname: "/auth/new-password",
            params: { email: email, otp: otpCode },
          });
          return;
        }
        try {
          const newUserMetaData = {
            ...user.metaData,
            is_verified: true,
          };
          await syncUserMetaData(user.id, newUserMetaData);
        } catch (e) {
          console.error("Failed to sync user meta data:", e);
          setError("Verification failed. Please try again.");
          return 1;
        }

        // Navigate to tracker
        router.replace("/onboarding");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(["", "", "", "", "", ""]);
    sendOTP_();
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
              disabled={!user ? true : false}
              style={styles.backButton}
              onPress={() => {
                router.back();
              }}
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
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to your email address. Please enter it
              below.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  placeholderTextColor="#9ca3af"
                />
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Timer and Resend */}
            <View style={styles.timerContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              disabled={isLoading}
              style={[
                styles.verifyButton,
                isLoading ? styles.loadingButton : null,
              ]}
              onPress={handleVerify}
            >
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            </TouchableOpacity>

            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>
                Remember your password?{" "}
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
  loadingButton: {
    opacity: 0.5,
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
    borderWidth: 0.2,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 1,
  },
  otpInputFilled: {
    borderWidth: 1,
    borderColor: "#2c2a6b",
  },
  otpInputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
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
    fontFamily: "Outfit-SemiBold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    marginLeft: 6,
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
