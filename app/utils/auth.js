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
      // console.error("Custom login failed", error);
      return {success: false, error: error}
    }
    return {success: true, error: null}
  } catch (error) {
    return {success: false, error: error}
    console.error("Error during custom login", error);
  }
};

export const signUpWithCustom = async (
  email,
  password,
  firstName,
  lastName,
  phone
) => {
  try {
    const { success, error } = await useAuthStore
      .getState()
      .signUp(email, password, firstName, lastName,phone);

    if (!success) {
      return {success: false, error: error}
      // console.error("Custom signup failed", error);
    }
    return {success: true, error: null}
  } catch (error) {
    return {success: false, error: error}
    console.error("Error during custom signup", error);
  }
};

// Log out
export const logOut = async () => {
  try {
    console.log("loging out");
    await useAuthStore.getState().logOut();
    return true;
  } catch (error) {
    return false
    console.error("Error during log out", error);
  }
};
