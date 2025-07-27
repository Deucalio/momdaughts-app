import { View, Button, Text } from "react-native";
// import { Button } from "@/components/Button";
import { useAuthStore } from "../utils/authStore";

export default function OnboardingFinalScreen() {
  const { completeOnboarding } = useAuthStore();

  return (
    <View>
      <Text>Onboarding Screen 2</Text>
      <Button title="Complete onboarding" onPress={completeOnboarding} />
    </View>
  );
}
