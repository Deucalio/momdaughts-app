import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from './utils/authStore';

export default function Index() {
  const { isLoggedIn, hasCompletedOnboarding, user, _hasHydrated } = useAuthStore();
  const isEmailVerified = user?.metaData?.is_verified === true;

  console.log("\n=== INDEX REDIRECT LOGIC ===");
  console.log("_hasHydrated:", _hasHydrated);
  console.log("isLoggedIn:", isLoggedIn);
  console.log("hasCompletedOnboarding:", hasCompletedOnboarding);
  console.log("isEmailVerified:", isEmailVerified);
  console.log("============================\n");

  // Wait for store to hydrate before making routing decisions
  if (!_hasHydrated) {
    console.log("⏳ Waiting for auth store to hydrate...");
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        <Text style={{ fontFamily: 'Outfit-Regular' }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Auth logic - redirect based on user state
  if (!isLoggedIn) {
    console.log("🔄 INDEX: Redirecting to /auth/login");
    return <Redirect href="/auth/login" />;
  }

  if (isLoggedIn && !isEmailVerified) {
    console.log("🔄 INDEX: Redirecting to /auth/otp");
    return <Redirect href="/auth/otp" />;
  }

  if (isLoggedIn && isEmailVerified && !hasCompletedOnboarding) {
    console.log("🔄 INDEX: Redirecting to /onboarding");
    return <Redirect href="/onboarding" />;
  }

  // User is fully authenticated
  console.log("🔄 INDEX: Redirecting to /(tabs)");
  return <Redirect href="/(tabs)" />;
}