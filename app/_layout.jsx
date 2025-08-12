// import "../global.css";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../web-nanoid-polyfill";
import { useAuthStore } from "./utils/authStore";
import { useEffect } from "react";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, setAuthData,  } = useAuthStore(); // Add setAuthData method

  const [loaded, error] = useFonts({
    'BadlocICG-Regular': require('./../assets/fonts/BadlocICG-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }


  console.log({
    isLoggedIn,
    hasCompletedOnboarding,
  });

  return (
    <>
      {/* <StatusBar style="auto" /> */}
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
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
