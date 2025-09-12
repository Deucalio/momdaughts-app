import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity, Platform } from "react-native";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { useAuthStore } from "../utils/authStore";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Apply navigation bar style when tab layout mounts
  // useEffect(() => {
  //   if (!user){
  //     router.push("/auth/login");
  //   }
  // }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ec4899", // Active icon color
        tabBarInactiveTintColor: "#6b7280", // Inactive icon color
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingBottom: insets.bottom + 5, // Add safe area bottom padding
          paddingTop: 5,
          height: 60 + insets.bottom, // Increase height to accommodate safe area
        },
        tabBarItemStyle: {
          // Remove the default press effect
          borderRadius: 0,
        },
        tabBarButton: (props) => {
          // Override the default button to remove press effects
          return (
            <TouchableOpacity
              {...props}
              activeOpacity={1} // No opacity change on press
              style={[props.style, { borderRadius: 0 }]}
            />
          );
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="home"
              size={focused ? size + 2 : size} // Reduced size increase for subtlety
              color={color}
            />
          ),
        }}
      />
   
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="bag"
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="fitness"
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="person-circle-outline"
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
