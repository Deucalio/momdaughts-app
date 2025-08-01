import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Linking, Platform } from "react-native";
import "../web-nanoid-polyfill";
import { useAuthStore } from "./utils/authStore";
import { exchangeCodeAsync, makeRedirectUri } from "expo-auth-session";
import { BASE_URL } from "../constants";

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, setAuthData } = useAuthStore(); // Add setAuthData method

  console.log({
    isLoggedIn,
    hasCompletedOnboarding,
  });

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isLoggedIn && hasCompletedOnboarding}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
