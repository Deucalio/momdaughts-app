// Fixed _layout.jsx with proper routing logic

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../web-nanoid-polyfill";
import * as NavigationBar from "expo-navigation-bar";
import { useAuthStore } from "./utils/authStore";
import { useEffect, useCallback } from "react";
import { Platform, AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { logOut } from "./utils/auth";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, setAuthData, user } =
    useAuthStore();

  // Check if user's email is verified
  const isEmailVerified = user?.metaData?.is_verified === true;
  console.log("\n ---user--", user, "\n ");

  const [loaded, error] = useFonts({
    "BadlocICG-Regular": require("./../assets/fonts/BadlocICG-Regular.ttf"),
  });

  // Function to set navigation bar style
  const setNavigationBarStyle = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setBackgroundColorAsync("#fff");
        await NavigationBar.setButtonStyleAsync("dark");
        console.log("Navigation bar style applied");
      } catch (error) {
        console.log("Error setting navigation bar:", error);
      }
    }
  }, []);

  // Apply on initial load
  useEffect(() => {
    setNavigationBarStyle();
  }, [setNavigationBarStyle]);

  // Apply when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        setNavigationBarStyle();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [setNavigationBarStyle]);

  // Apply when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setNavigationBarStyle();
    }, [setNavigationBarStyle])
  );

  // Apply after splash screen hides
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().then(() => {
        // Small delay to ensure the app is fully rendered
        setTimeout(() => {
          setNavigationBarStyle();
        }, 100);
      });
    }
  }, [loaded, error, setNavigationBarStyle]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />

      <Stack screenOptions={{ headerShown: false }}>
        {/* Protected routes - require login, completed onboarding, and verified email */}
        <Stack.Protected
          guard={isLoggedIn && hasCompletedOnboarding && isEmailVerified}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen
            name="products/[id].jsx"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="screens" options={{ headerShown: false }} />
          <Stack.Screen name="products" options={{ headerShown: false }} />
          <Stack.Screen name="articles" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Auth routes - for users who are not logged in */}
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/forget" options={{ headerShown: false }} />
          {/* <Stack.Screen name="auth/otp" options={{ headerShown: false }} /> */}
          <Stack.Screen
            name="auth/new-password"
            options={{ headerShown: false }}
          />
        </Stack.Protected>

        {/* OTP verification - for logged in users who haven't verified their email */}
        <Stack.Protected guard={!isLoggedIn || !isEmailVerified}>
          <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Onboarding - for logged in users who have verified email but haven't completed onboarding */}
        <Stack.Protected
          guard={isLoggedIn && !hasCompletedOnboarding && isEmailVerified}
        >
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
