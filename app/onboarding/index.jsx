import { View, Button, Text } from "react-native";
// import { AppText } from "@/components/AppText";
// import { Button } from "@/components/Button";
import { router } from "expo-router";

export default function OnboardingFirstScreen() {
  return (
    <View>
      <Text>Onboarding Screen 1</Text>
      {/* <Link asChild push href="/onboarding/final"> */}
      <Button
        onPress={() => router.push("/onboarding/final")}
        title="Go to screen 2"
      />
      {/* </Link> */}
    </View>
  );
}
