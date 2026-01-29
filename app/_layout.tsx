import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="enrollment/typing" />
        <Stack.Screen name="enrollment/swipe" />
        <Stack.Screen name="enrollment/tap" />
        <Stack.Screen name="enrollment/motion" />
        <Stack.Screen name="enrollment/complete" />
        <Stack.Screen name="authenticated" />
        <Stack.Screen name="lock" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
