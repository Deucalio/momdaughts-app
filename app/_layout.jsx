import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useAuthStore } from "./utils/authStore";
import { useEffect, useCallback, useState } from "react";
import { Platform, AppState, View, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// Override React Native's Text with your custom one globally
import { Text as RNText } from "react-native";
RNText.defaultProps = RNText.defaultProps || {};
RNText.defaultProps.style = { fontFamily: "Outfit-Regular" };

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, user, _hasHydrated } =
    useAuthStore();

  // Check if user's email is verified
  const isEmailVerified = user?.metaData?.is_verified === true;

  const [loaded, fontError] = useFonts({
    "BadlocICG-Regular": require("./../assets/fonts/BadlocICG-Regular.ttf"),
    "Outfit-Thin": require("./../assets/fonts/Outfit-Thin.ttf"),
    "Outfit-ExtraLight": require("./../assets/fonts/Outfit-ExtraLight.ttf"),
    "Outfit-Light": require("./../assets/fonts/Outfit-Light.ttf"),
    "Outfit-Regular": require("./../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Medium": require("./../assets/fonts/Outfit-Medium.ttf"),
    "Outfit-SemiBold": require("./../assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Bold": require("./../assets/fonts/Outfit-Bold.ttf"),
    "Outfit-ExtraBold": require("./../assets/fonts/Outfit-ExtraBold.ttf"),
    "Outfit-Black": require("./../assets/fonts/Outfit-Black.ttf"),
  });

  const setNavigationBarStyle = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setBackgroundColorAsync("#fff");
        await NavigationBar.setButtonStyleAsync("dark");
      } catch (error) {
        console.log("Error setting navigation bar:", error);
      }
    }
  }, []);

  useEffect(() => {
    setNavigationBarStyle();
  }, [setNavigationBarStyle]);

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

  useFocusEffect(
    useCallback(() => {
      setNavigationBarStyle();
    }, [setNavigationBarStyle])
  );

  // Hide splash screen when everything is ready
  const hideSplashScreen = useCallback(async () => {
    const areResourcesReady = (loaded || fontError) && _hasHydrated;

    if (areResourcesReady) {
      console.log("\n=== HIDING SPLASH SCREEN ===");
      console.log("Fonts loaded:", loaded);
      console.log("Auth hydrated:", _hasHydrated);
      console.log("isLoggedIn:", isLoggedIn);
      console.log("============================\n");

      try {
        await SplashScreen.hideAsync();
        // Set navigation bar style after splash is hidden
        setTimeout(() => {
          setNavigationBarStyle();
        }, 100);
      } catch (error) {
        console.warn("Error hiding splash screen:", error);
      }
    }
  }, [loaded, fontError, _hasHydrated, isLoggedIn, setNavigationBarStyle]);

  useEffect(() => {
    hideSplashScreen();
  }, [hideSplashScreen]);

  // Don't render anything until resources are ready
  if (!loaded && !fontError) {
    console.log("⏳ Waiting for fonts to load...");
    return null;
  }

  if (!_hasHydrated) {
    console.log("⏳ Waiting for auth store to hydrate...");
    return null;
  }

  console.log("\n=== RENDERING APP ===");
  console.log("isLoggedIn:", isLoggedIn);
  console.log("isEmailVerified:", isEmailVerified);
  console.log("hasCompletedOnboarding:", hasCompletedOnboarding);
  console.log("====================\n");

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />

      <Stack screenOptions={{ headerShown: false }}>
        {/* Not logged in - show auth screens */}
        {isLoggedIn === false && (
          <>
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen name="auth/forget" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth/new-password"
              options={{ headerShown: false }}
            />
          </>
        )}

        {/* Logged in but email not verified - show OTP */}
        {isLoggedIn === true && !isEmailVerified && (
          <>
            <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          </>
        )}

        {/* Logged in, email verified but onboarding not complete */}
        {isLoggedIn === true &&
          isEmailVerified &&
          hasCompletedOnboarding === false && (
            <>
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="auth/login"
                options={{ headerShown: false }}
              />
            </>
          )}

        {/* Fully authenticated - show main app */}
        {isLoggedIn === true &&
          isEmailVerified &&
          hasCompletedOnboarding === true && (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="cart/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="products/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="articles/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="articles/index"
                options={{ headerShown: false }}
              />
              {/* Screen group routes */}
              <Stack.Screen
                name="screens/aboutus"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/checkout"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/edit-profile"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/exercise"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/helpsupport"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/quiz"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/referral"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/start"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/terms"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/test"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/tracker"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/wishlist"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/addresses/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/addresses/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/collections/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/ipl/dashboard"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/ipl/onboard"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/orders/index.jsx"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="screens/orders/[id].jsx"
                options={{ headerShown: false }}
              />
            </>
          )}

        {/* Auth fallback - always available */}
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
