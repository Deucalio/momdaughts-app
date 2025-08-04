
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  // Simple redirect to tabs for now
  return <Redirect href="/(tabs)" />;
}