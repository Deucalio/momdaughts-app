import { View, Button, Text } from "react-native";
// import { Button } from "@/components/Button";
import { useAuthStore, useAuthenticatedFetch } from "../utils/authStore";
import { appendShippingAdresses } from "../utils/actions";
import { useEffect } from "react";
export default function OnboardingFinalScreen() {
  const { completeOnboarding } = useAuthStore();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuthStore();

  useEffect(() => {
    appendShippingAdresses(authenticatedFetch, user.email);
    // Also Create a Customer (first check, if the customer already exists, if not, then create one)
    // createCustomer(authenticatedFetch, user.id)
  }, []);

  return (
    <View>
      <Text>Onboarding Screen 2</Text>
      <Button title="Complete onboarding" onPress={completeOnboarding} />
    </View>
  );
}
