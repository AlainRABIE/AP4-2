import { Stack } from 'expo-router';
import { UserProvider } from '../services/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </UserProvider>
  );
}
