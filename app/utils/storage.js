import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../utils/authStore";
// Update user's metaData by working with the auth store
export const updateUserMetaData = (newMetaData) => {
  // Import the store without using the hook
  const store = useAuthStore.getState();

  try {
    // Update the user object with new metaData
    const updatedUser = {
      ...store.user,
      metaData: { ...store.user.metaData, ...newMetaData },
    };
    useAuthStore.setState({ user: updatedUser });
    console.log("User metaData updated:", updatedUser.metaData);
    return { success: true, data: updatedUser.metaData };
  } catch (error) {
    console.error("Failed to update user metaData:", error);
    return { success: false, error: error.message };
  }
};

// Get user's current metaData
export const getUserMetaData = () => {
  const { useAuthStore } = require("./authStore");
  const store = useAuthStore.getState();

  if (!store.user) {
    return { success: false, error: "No user found" };
  }

  return {
    success: true,
    data: store.user.metaData || {},
  };
};

// Set user's metaData (replaces existing metaData)
export const setUserMetaData = (metaData) => {
  const { useAuthStore } = require("./authStore");
  const store = useAuthStore.getState();

  if (!store.user) {
    console.error("No user found to set metaData");
    return { success: false, error: "No user found" };
  }

  try {
    const updatedUser = {
      ...store.user,
      metaData,
    };

    useAuthStore.setState({ user: updatedUser });

    console.log("User metaData set:", metaData);
    return { success: true, data: metaData };
  } catch (error) {
    console.error("Failed to set user metaData:", error);
    return { success: false, error: error.message };
  }
};

// Clear user's metaData
export const clearUserMetaData = () => {
  const { useAuthStore } = require("./authStore");
  const store = useAuthStore.getState();

  if (!store.user) {
    return { success: false, error: "No user found" };
  }

  try {
    const updatedUser = {
      ...store.user,
      metaData: {},
    };

    useAuthStore.setState({ user: updatedUser });

    console.log("User metaData cleared");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear user metaData:", error);
    return { success: false, error: error.message };
  }
};

// Legacy generic functions for backward compatibility
export const updateMetaData = async (key, data) => {
  try {
    const storedData = await AsyncStorage.getItem(key);
    if (!storedData) {
      console.error("No data found for key:", key);
      return { success: false, error: "No existing data found" };
    }

    const metaData = JSON.parse(storedData);
    console.log("Original metaData:", metaData);
    console.log("Data to merge:", data);

    const updatedMetaData = { ...metaData, ...data };
    await AsyncStorage.setItem(key, JSON.stringify(updatedMetaData));

    console.log("Updated metaData:", updatedMetaData);
    return { success: true, data: updatedMetaData };
  } catch (error) {
    console.error("Failed to update meta data:", error);
    return { success: false, error: error.message };
  }
};

export const setMetaData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return { success: true, data };
  } catch (error) {
    console.error("Failed to set meta data:", error);
    return { success: false, error: error.message };
  }
};

export const getMetaData = async (key) => {
  try {
    const storedData = await AsyncStorage.getItem(key);
    if (!storedData) {
      return { success: false, error: "No data found" };
    }

    const metaData = JSON.parse(storedData);
    return { success: true, data: metaData };
  } catch (error) {
    console.error("Failed to get meta data:", error);
    return { success: false, error: error.message };
  }
};

export const removeMetaData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove meta data:", error);
    return { success: false, error: error.message };
  }
};
