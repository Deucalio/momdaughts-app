import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// const isLoggedIn = false;
// const shouldCreateAccount = false; // This can be used to conditionally render the signup screen
import { useAuthStore } from "./utils/authStore";

export default function RootLayout() {
  const { isLoggedIn, shouldCreateAccount, hasCompletedOnboarding } =
    useAuthStore();

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
          <Stack.Protected guard={shouldCreateAccount}>
            <Stack.Screen name="signup" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack.Protected>
        <Stack.Protected guard={!hasCompletedOnboarding && isLoggedIn}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
