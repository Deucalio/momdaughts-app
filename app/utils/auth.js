// auth.js (Google OAuth Integration)

import { useAuthStore } from "./authStore";

export const signInWithGoogle = async () => {
  try {
    await useAuthStore.getState().signInWithGoogle();
  } catch (error) {
    console.error("Error during Google login", error);
  }
};

// Custom login example
export const signInWithCustom = async (email, password) => {
  try {
    const { success, error } = await useAuthStore
      .getState()
      .logIn(email, password);

    if (!success) {
      console.error("Custom login failed", error);
    }
  } catch (error) {
    console.error("Error during custom login", error);
  }
};

export const signUpWithCustom = async (
  email,
  password,
  firstName,
  lastName
) => {
  try {
    const { success, error } = await useAuthStore
      .getState()
      .signUp(email, password, firstName, lastName);

    if (!success) {
      console.error("Custom signup failed", error);
    }
  } catch (error) {
    console.error("Error during custom signup", error);
  }
};

// Log out
export const logOut = async () => {
  try {
    console.log("loging out");
    await useAuthStore.getState().logOut();
  } catch (error) {
    console.error("Error during log out", error);
  }
};
