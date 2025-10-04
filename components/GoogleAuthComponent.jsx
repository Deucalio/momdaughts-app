// GoogleAuthComponent.tsx
import { makeRedirectUri } from "expo-auth-session";
import { Image } from 'expo-image';
import * as WebBrowser from "expo-web-browser";
import {
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { useAuthStore } from "../app/utils/authStore";
import { BASE_URL } from "../constants";
import Text from "./Text";
import {router, useRootNavigationState } from "expo-router";
import { useEffect, useState, useCallback} from "react";

WebBrowser.maybeCompleteAuthSession();

const GoogleAuthComponent = () => {
  const { setTokenDirectly, user } = useAuthStore();
    const rootNavigationState = useRootNavigationState();

    const [isMounted, setIsMounted] = useState(false);

  // Wait for component to mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const signIn = async () => {
    try {
      const redirectUri = makeRedirectUri();
      const state = Math.random().toString(36).substring(7); // Generate random state
      
      console.log('🔧 Redirect URI:', redirectUri);
      console.log('🔧 Generated state:', state);
      
      // Use your Fastify backend endpoint
      const authUrl = `${BASE_URL}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      
      console.log('🚀 Opening auth URL:', authUrl);
      
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
      
      console.log('🔍 Auth result:', result);
      
      if (result.type === 'success' && result.url) {
        console.log('✅ Success! Received URL:', result.url);
        
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const returnedState = url.searchParams.get('state');
        const user_ = url.searchParams.get('user');
        const error = url.searchParams.get('error');
        
        console.log('🔍 Parsed params - token:', token, 'state:', returnedState, 'error:', error);
        
        if (error) {
          console.error('❌ OAuth error:', error);
          return;
        }
        
        if (token && returnedState === state) {
          console.log('✅ Authentication successful, setting token');
          // setTokenDirectly(token);
          // router.replace("/(tabs)");
        } else {
          console.error('❌ State mismatch or missing token');
          console.error('Expected state:', state, 'Received state:', returnedState);
        }
      } else if (result.type === 'cancel') {
        console.log('🚫 User cancelled OAuth flow');
      } else {
        console.log('❌ OAuth failed:', result);
      }
      
    } catch (error) {
      console.error('💥 Google sign-in error:', error);
    }
  };

  if (user?.metaData.authMethod === "google"){
    router.replace("/(tabs)");
  }

  // useEffect(() => {
  //   if (
  //     isMounted && 
  //     rootNavigationState?.key && 
  //     user?.metaData.authMethod === "google"
  //   ) {
  //     // Add a small delay to ensure everything is fully ready
  //     const timer = setTimeout(() => {
  //       router.replace("/(tabs)");
  //     }, 0);

  //     return () => clearTimeout(timer);
  //   }
  // }, [isMounted, rootNavigationState?.key, user, router]);

  return (
    <TouchableOpacity onPress={signIn} style={styles.socialButton}>
      <Image
        source={require("../assets/images/google-logo.svg")}
        contentFit="contain"
        placeholder="Brand Logo"
        style={{
          width: 20,
          height: 20,
          borderRadius: 12,
        }}  
      />
      <Text style={styles.socialButtonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 0.2,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: "#1f2937",
  },
});

export default GoogleAuthComponent;