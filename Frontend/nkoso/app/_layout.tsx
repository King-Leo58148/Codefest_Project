import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export { ErrorBoundary } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function RootLayoutNav() {
  const { user, loadStoredAuth } = useAuthStore();
  const { themeMode } = useThemeStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      await loadStoredAuth();
      setAuthChecked(true);
    })();
  }, []);

  const segments = useSegments() as string[];

  useEffect(() => {
    if (authChecked) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isIndex = segments.length === 0 || segments[0] === 'index';

    if (!user && !inAuthGroup && !isIndex) {
      router.replace('/(auth)/welcome');
    }
  }, [user, authChecked, segments]);

  const isDark = themeMode === 'dark';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(investor)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="pitch/[id]" />
        <Stack.Screen name="invest/[id]" />
        <Stack.Screen name="deal/[id]" />
        <Stack.Screen name="bid/[id]" />
        <Stack.Screen name="repayments/[pitchId]" />
        <Stack.Screen name="profile/personal-info" />
        <Stack.Screen name="profile/bank-account" />
        <Stack.Screen name="profile/verification" />

        <Stack.Screen name="profile/notification-settings" />
        <Stack.Screen name="profile/email-preferences" />
        <Stack.Screen name="profile/payment-methods" />
        <Stack.Screen name="profile/help" />
        <Stack.Screen name="profile/contact-support" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}
