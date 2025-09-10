// GoogleAuthComponent.tsx
import {
    AuthRequestConfig,
    DiscoveryDocument,
    makeRedirectUri,
    useAuthRequest
} from "expo-auth-session";
import { Image } from 'expo-image';
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";
import { useAuthStore } from "../app/utils/authStore";
import { BASE_URL } from "../constants";
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
    borderWidth: 0.2,
    // borderColor: "#ffffff",
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 22,
    // width: "70%",
    borderRadius: 12,
    // backgroundColor: "#ffffff",

  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
});

export default GoogleAuthComponent;