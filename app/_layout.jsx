// Updated _layout.jsx with multiple approaches

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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, setAuthData } = useAuthStore();

  const [loaded, error] = useFonts({
    "BadlocICG-Regular": require("./../assets/fonts/BadlocICG-Regular.ttf"),
  });

  // Function to set navigation bar style
  const setNavigationBarStyle = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setBackgroundColorAsync("#21152B");
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

    const subscription = AppState.addEventListener("change", handleAppStateChange);
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
      <StatusBar
        style="dark"
        backgroundColor="#ffffff" // Change to solid white instead of transparent
        translucent={false} // Set to false for more reliable behavior
      />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isLoggedIn && hasCompletedOnboarding}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen
            name="products/[id].jsx"
            options={{ headerShown: false }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!hasCompletedOnboarding && isLoggedIn}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}