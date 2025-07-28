import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setItem, getItem, deleteItemAsync } from "expo-secure-store";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface UserState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
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
  logInAsVip: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const BASE_URL = "http://192.168.18.5:3000";

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
      logIn: async (email: string, password: string) => {
        try {
          const response = await fetch(`${BASE_URL}/login`, {
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
          const response = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, firstName, lastName }),
          });

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
            await fetch(`${BASE_URL}/logout`, {
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

        set({
          token: null,
          user: null,
          isVip: false,
          isLoggedIn: false,
        });
      },
      logInAsVip: () => {
        set({
          isVip: true,
          isLoggedIn: true,
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
