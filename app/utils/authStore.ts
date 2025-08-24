import { BASE_URL } from "@/constants";
import { exchangeCodeAsync, makeRedirectUri } from "expo-auth-session";
import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import * as jose from "jose";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  metaData?: any;
}

interface UserState {
  setAuthData: (authData: any) => void;
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  authMethod: "google" | "custom" | null; // 'google' or 'custom'
  logIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  logInWithGoogle: (googleUser: any) => void;
  syncUserMetaData: (userId: any, newMetaData: any) => Promise<void>;
  tokens: any;
}

const BACKEND_URL = "http://192.168.100.192:3000";

export const useAuthStore = create(
  persist<UserState>(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      shouldCreateAccount: false,
      hasCompletedOnboarding: false,
      isVip: false,
      _hasHydrated: false,
      authMethod: null,
      tokens: null,
      syncUserMetaData: async (userId: any, metaData: any) => {
        try {
          const response = await fetch(`${BACKEND_URL}/sync/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, metaData }),
          })
          console.log("body:", JSON.stringify({ userId, metaData }));
          console.log("syncUserMetaData response status:", response);
          if (response.ok) {
            const data = await response.json();
            set({
              isLoggedIn: true,
              user: get().user
                ? ({
                    ...get().user,
                    metaData: data.metaData,
                  } as User)
                : null,
            });
          }
        } catch (error) {
          console.error("Failed to sync user meta data:", error);
        }
      },
      logInWithGoogle: (googleUser: any) => {},
      setAuthData: async (authData: any) => {
        const discovery = {
          authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
          tokenEndpoint: `${BASE_URL}/api/auth/token`,
        };

        console.log("Setting auth data:", authData);
        const code = authData;
        let tokenResponse;
        try {
          tokenResponse = await exchangeCodeAsync(
            {
              code,
              extraParams: {
                platform: Platform.OS,
              },
              clientId: "google",
              redirectUri: makeRedirectUri(),
            },
            discovery
          );
          console.log("tokenResponse: ", tokenResponse);
        } catch (e) {
          console.log("error: ", e);
        }

        const rawResponse = tokenResponse?.rawResponse as {
          accessToken: string;
        };
        const accessToken = rawResponse?.accessToken;
        const decoded = jose.decodeJwt(accessToken);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          decoded,
        });

        const requestOptions: any = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        // For loggin purpose, send the data to backend
        fetch("http://192.168.99.137:3000", requestOptions)
          .then((response) => response.text())
          .then((result) => console.log(result))
          .catch((error) => console.log("error", error));
        set({
          isLoggedIn: true,
          // hasCompletedOnboarding: false
          user: {
            id: String(decoded.exp || ""),
            firstName: String(decoded.family_name || ""),
            lastName: String(decoded.given_name || ""),
            email: String(decoded.email || ""),
          },
          // tokens: authData.tokens,
          authMethod: "google",
        });
      },

      logIn: async (email: string, password: string) => {
        try {
          const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Login failed:", errorData);
            return { success: false, error: errorData.error || "Login failed" };
          }

          const data = await response.json();
          const { token, user } = data;

          if (!token) {
            return { success: false, error: "Token missing from response" };
          }

          console.log("Login successful:", {
            user,
            token: token.substring(0, 20) + "...",
          });

          set({
            token,
            user,
            isLoggedIn: true,
            authMethod: "custom",
          });

          return { success: true };
        } catch (error: any) {
          console.error("Network error during login:", error);
          return { success: false, error: "Network error occurred" };
        }
      },

      signUp: async (
        email: string,
        password: string,
        firstName: string,
        lastName: string
      ) => {
        try {
          const response = await fetch(`${BACKEND_URL}/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, firstName, lastName }),
          });
          console.log("Signup response status:", response);

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Signup failed:", errorData);
            return {
              success: false,
              error: errorData.error || "Signup failed",
            };
          }

          const data = await response.json();
          const { token, user } = data;

          if (!token) {
            return { success: false, error: "Token missing from response" };
          }

          console.log("Signup successful:", {
            user,
            token: token.substring(0, 20) + "...",
          });

          set({
            token,
            user,
            isLoggedIn: true,
            authMethod: "custom",
            shouldCreateAccount: false,
            hasCompletedOnboarding: false,
          });

          return { success: true };
        } catch (error: any) {
          console.error("Network error during signup:", error);
          return { success: false, error: "Network error occurred" };
        }
      },
      logOut: async () => {
        const { token } = get();

        // Call logout endpoint to invalidate session on server
        if (token) {
          try {
            await fetch(`${BACKEND_URL}/logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
          } catch (error) {
            console.error("Error during server logout:", error);
            // Continue with local logout even if server logout fails
          }
        }

        console.log("logging out", token);
        set({
          token: null,
          user: null,
          isLoggedIn: false,
          authMethod: null,
        });
      },
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
      resetOnboarding: () => {
        set({ hasCompletedOnboarding: false });
      },
      setHasHydrated: (value: boolean) => {
        set({ _hasHydrated: value });
      },
      // Helper function to make authenticated requests
      fetchWithAuth: async (url: string, options: RequestInit = {}) => {
        const { token } = get();

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...((options.headers as Record<string, string>) || {}),
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => ({
        setItem,
        getItem,
        removeItem: deleteItemAsync,
      })),
      onRehydrateStorage: (state) => () => state?.setHasHydrated(true),
    }
  )
);

// Hook to use authenticated fetch
export const useAuthenticatedFetch = () => {
  const fetchWithAuth = useAuthStore((state) => state.fetchWithAuth);
  const token = useAuthStore((state) => state.token);
  const logOut = useAuthStore((state) => state.logOut);

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetchWithAuth(url, options);

      // If we get a 401, the token might be expired
      if (response.status === 401) {
        console.log("Token expired, logging out");
        logOut();
        throw new Error("Token expired");
      }

      return response;
    } catch (error) {
      console.error("Authenticated fetch error:", error);
      throw error;
    }
  };

  return { authenticatedFetch, hasToken: !!token };
};
