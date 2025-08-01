// GoogleAuthComponent.tsx
import React, { useEffect } from "react";
import { BASE_URL } from "../constants";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import {
  AuthRequestConfig,
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../app/utils/authStore";
import * as jose from "jose";
WebBrowser.maybeCompleteAuthSession();

// Our OAuth flow uses a server-side approach for enhanced security:
// 1. Client initiates OAuth flow with Google through our server
// 2. Google redirects to our server's /api/auth/authorize endpoint
// 3. Our server handles the OAuth flow with Google using server-side credentials
// 4. Client receives an authorization code from our server
// 5. Client exchanges the code for tokens through our server
// 6. Server uses its credentials to get tokens from Google and returns them to the client
const discovery: DiscoveryDocument = {
  // URL where users are redirected to log in and grant authorization.
  // Our server handles the OAuth flow with Google and returns the authorization code
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  // URL where our server exchanges the authorization code for tokens
  // Our server uses its own credentials (client ID and secret) to securely exchange
  // the code with Google and return tokens to the client
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

const GoogleAuthComponent = () => {
  // const { logInWithGoogle } = useAuthStore();
  const { setAuthData } = useAuthStore();

  const config: AuthRequestConfig = {
    clientId: "google",
    scopes: ["openid", "profile", "email"],
    // redirectUri: "momdaughts://",
    redirectUri: makeRedirectUri(),
  };

  console.log("🔧 Config redirect URI:", config.redirectUri);
  console.log("🔧 makeRedirectUri() result:", makeRedirectUri());
  // This is where useAuthRequest goes - in your component, not in the store
  const [request, response, promptAsync] = useAuthRequest(config, discovery);

  console.log("response-:", response);

  const handleResponse = async () => {
    if (response?.type === "success") {
      const { code } = response.params;


      setAuthData(code);
    }
  };

  useEffect(() => {
    handleResponse();
  }, [response]);

  const signIn = async () => {
    try {
      if (!request) {
        console.error("No request found");
        return;
      }
      console.log("Request:", request);
      console.log("config", config);
      console.log("Discovery:", discovery);
      await promptAsync();
    } catch (error) {
      console.error("Error during Google login", error);
    }
  };

  return (
    <TouchableOpacity onPress={signIn} style={styles.socialButton}>
      <Ionicons name="logo-google" size={20} color="#4285f4" />
      <Text style={styles.socialButtonText}>Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#fce7f3",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
});

export default GoogleAuthComponent;
