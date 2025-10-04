import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from './utils/authStore';

export default function Index() {
  const { isLoggedIn, hasCompletedOnboarding, user, _hasHydrated, authMethod} = useAuthStore();
  const isEmailVerified = user?.metaData?.is_verified === true;

  console.log("\n=== INDEX REDIRECT LOGIC ===");
  console.log("user:", user);
  console.log("_hasHydrated:", _hasHydrated);
  console.log("isLoggedIn:", isLoggedIn);
  console.log("hasCompletedOnboarding:", hasCompletedOnboarding);
  console.log("isEmailVerified:", isEmailVerified);
  console.log("authMethod:", authMethod);
  console.log("============================\n");

  // Wait for store to hydrate before making routing decisions
  if (!_hasHydrated) {
    console.log("⏳ INDEX: Waiting for auth store to hydrate...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  // if (user.metaData.authMethod === 'google') {
  //   console.log("🔄 INDEX: Redirecting to /index");
  //   return <Redirect href="/(tabs)" />;
  // }

  // Auth logic - redirect based on user state
  if (!isLoggedIn) {
    console.log("🔄 INDEX: Redirecting to /auth/login");
    return <Redirect href="/auth/login" />;
  }

  if (isLoggedIn && !isEmailVerified && user) {
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    marginTop: 16,
    color: '#666',
  },
});