import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useAuthStore } from "./utils/authStore";
import { useEffect, useCallback, useState } from "react";
import { Platform, AppState, View, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { logOut } from "./utils/auth";

// Override React Native's Text with your custom one globally
import { AppRegistry, Text as RNText } from 'react-native';
RNText.defaultProps = RNText.defaultProps || {};
RNText.defaultProps.style = { fontFamily: 'Outfit-Regular' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, user } = useAuthStore();
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check if user's email is verified
  const isEmailVerified = user?.metaData?.is_verified === true;
  
  // Wait for auth store to be properly initialized
  useEffect(() => {
    // Check if auth store has been hydrated
    const checkAuthInit = () => {
      // In development builds, the store might take longer to initialize
      if (isLoggedIn !== undefined && hasCompletedOnboarding !== undefined) {
        console.log("✅ Auth store initialized");
        setAuthInitialized(true);
      } else {
        console.log("⏳ Auth store not yet initialized...");
        console.log("isLoggedIn:", isLoggedIn);
        console.log("hasCompletedOnboarding:", hasCompletedOnboarding);
        console.log("user:", user);
      }
    };

    // Initial check
    checkAuthInit();

    // If not initialized, keep checking
    if (!authInitialized) {
      const interval = setInterval(checkAuthInit, 100);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, hasCompletedOnboarding, authInitialized, user]);
  
  console.log("\n=== DETAILED DEBUG ===");
  console.log("authInitialized:", authInitialized);
  console.log("isLoggedIn:", isLoggedIn, typeof isLoggedIn);
  console.log("hasCompletedOnboarding:", hasCompletedOnboarding, typeof hasCompletedOnboarding);
  console.log("isEmailVerified:", isEmailVerified, typeof isEmailVerified);
  console.log("user:", user);
  console.log("====================\n");

  const [loaded, error] = useFonts({
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

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().then(() => {
        setTimeout(() => {
          setNavigationBarStyle();
        }, 100);
      });
    }
  }, [loaded, error, setNavigationBarStyle]);

  // Show loading until fonts are loaded
  if (!loaded && !error) {
    return null;
  }

  // Show loading until auth is initialized
  if (!authInitialized) {
    console.log("🔄 Showing auth loading screen");
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'white' 
      }}>
        <Text style={{ fontFamily: 'Outfit-Regular' }}>
          Initializing Auth...
        </Text>
        <Text style={{ 
          fontSize: 12, 
          marginTop: 10, 
          fontFamily: 'Outfit-Regular',
          color: '#666' 
        }}>
          isLoggedIn: {String(isLoggedIn)}{'\n'}
          hasCompletedOnboarding: {String(hasCompletedOnboarding)}
        </Text>
      </View>
    );
  }

  // Now that auth is initialized, render based on state
  if (isLoggedIn === false) {
    console.log("📱 RENDERING: Auth screens only (isLoggedIn === false)");
    return (
      <>
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/forget" options={{ headerShown: false }} />
          <Stack.Screen name="auth/new-password" options={{ headerShown: false }} />
        </Stack>
      </>
    );
  }
  
  if (isLoggedIn === true && !isEmailVerified) {
    console.log("📱 RENDERING: OTP screen only");
    return (
      <>
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
          {/* Include auth screens for navigation */}
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        </Stack>
      </>
    );
  }
  
  if (isLoggedIn === true && isEmailVerified && hasCompletedOnboarding === false) {
    console.log("📱 RENDERING: Onboarding screen only");
    return (
      <>
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          {/* Include auth screens for navigation */}
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        </Stack>
      </>
    );
  }
  
  if (isLoggedIn === true && isEmailVerified && hasCompletedOnboarding === true) {
    console.log("📱 RENDERING: Main app screens");
    return (
      <>
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="products/[id].jsx" options={{ headerShown: false }} />
          <Stack.Screen name="screens" options={{ headerShown: false }} />
          <Stack.Screen name="products" options={{ headerShown: false }} />
          <Stack.Screen name="articles" options={{ headerShown: false }} />
          {/* Keep auth screens available for logout */}
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        </Stack>
      </>
    );
  }

  // Fallback - should never reach here if auth store is working correctly
  console.log("❌ FALLBACK: Unexpected auth state, showing login");
  console.log("Final state - isLoggedIn:", isLoggedIn, "hasCompletedOnboarding:", hasCompletedOnboarding, "isEmailVerified:", isEmailVerified);
  
  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forget" options={{ headerShown: false }} />
        <Stack.Screen name="auth/new-password" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}