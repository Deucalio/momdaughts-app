import { View, TouchableOpacity } from "react-native";
// import { Button } from "@/components/Button";
import { useAuthStore, useAuthenticatedFetch } from "../utils/authStore";
import { appendShippingAdresses } from "../utils/actions";
import { useEffect } from "react";
import Text from "../../components/Text";
import { router } from "expo-router";

export default function OnboardingFinalScreen() {
  const { completeOnboarding } = useAuthStore();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuthStore();

  useEffect(() => {
    appendShippingAdresses(authenticatedFetch, user.email);
    // Also Create a Customer (first check, if the customer already exists, if not, then create one)
    // createCustomer(authenticatedFetch, user.id)
  }, []);

  const completeOnboarding_ = async () => {
    completeOnboarding();
    router.push("/(tabs)");
  };

  return (
    <View>
      <Text>Onboarding Screen 2</Text>
      {/* <Button title="Complete onboarding" onPress={completeOnboarding} /> */}
      <TouchableOpacity onPress={() => completeOnboarding_()}>
        <Text
          style={{
            color: "blue",
            margin: 32,
            borderWidth: 1,
            padding: 16,
          }}
        >
          Complete onboarding
        </Text>
      </TouchableOpacity>
    </View>
  );
}
